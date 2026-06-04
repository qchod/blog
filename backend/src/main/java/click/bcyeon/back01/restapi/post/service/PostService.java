package click.bcyeon.back01.restapi.post.service;

import click.bcyeon.back01.restapi.post.dto.*;
import click.bcyeon.back01.restapi.post.mapper.PostMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${file.upload.image-path}")
    private String imagePath;

    @Value("${file.upload.attachment-path}")
    private String attachmentPath;

    public String uploadImage(MultipartFile file) throws IOException {
        String savedName = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        File dest = new File(imagePath + File.separator + savedName);
        dest.getParentFile().mkdirs();
        file.transferTo(dest);
        return "/files/post/images/" + savedName;
    }

    public PostDto savePost(PostDto postDto, MultipartFile[] attachments) throws IOException {
        postMapper.insertPost(postDto);

        List<PostFileDto> files = new ArrayList<>();

        // content 내 이미지 저장
        for (String url : extractAllImageUrls(postDto.getContent())) {
            String savedName = url.substring(url.lastIndexOf("/") + 1);
            PostFileDto fileDto = new PostFileDto();
            fileDto.setPostId(postDto.getId());
            fileDto.setOriginalName(savedName);
            fileDto.setSavedName(savedName);
            fileDto.setFileType("image");
            fileDto.setFileUrl(url);
            postMapper.insertPostFile(fileDto);
            files.add(fileDto);
        }

        // 첨부파일 저장
        if (attachments != null) {
            for (MultipartFile attachment : attachments) {
                if (attachment == null || attachment.isEmpty()) continue;

                String savedName = UUID.randomUUID() + getExtension(attachment.getOriginalFilename());
                File dest = new File(attachmentPath + File.separator + savedName);
                dest.getParentFile().mkdirs();
                attachment.transferTo(dest);

                PostFileDto fileDto = new PostFileDto();
                fileDto.setPostId(postDto.getId());
                fileDto.setOriginalName(attachment.getOriginalFilename());
                fileDto.setSavedName(savedName);
                fileDto.setFileType("attachment");
                fileDto.setFileUrl("/files/post/attachments/" + savedName);
                postMapper.insertPostFile(fileDto);
                files.add(fileDto);
            }
        }

        postDto.setFiles(files);
        return postDto;
    }

    public PostDto getPost(int id) {
        PostDto post = postMapper.selectPost(id);
        if (post == null) return null;
        List<PostFileDto> attachments = postMapper.selectPostFiles(id).stream()
                .filter(f -> "attachment".equals(f.getFileType()))
                .toList();
        post.setFiles(attachments);
        return post;
    }

    public void deletePost(int id) {
        List<PostFileDto> files = postMapper.selectPostFiles(id);
        for (PostFileDto file : files) {
            String dir = "image".equals(file.getFileType()) ? imagePath : attachmentPath;
            new File(dir + File.separator + file.getSavedName()).delete();
        }
        postMapper.deletePostFiles(id);
        postMapper.softDeletePost(id);
    }

    public PostListResponse getPostList(int lastId, int size) {
        List<PostListRawDto> raw = postMapper.selectPostList(lastId, size + 1);
        boolean hasNext = raw.size() > size;
        if (hasNext) raw = raw.subList(0, size);

        List<PostListItemDto> posts = raw.stream().map(r -> {
            PostListItemDto item = new PostListItemDto();
            item.setId(r.getId());
            item.setTitle(r.getTitle());
            item.setSummary(extractSummary(r.getContent()));
            item.setCreatedAt(r.getCreatedAt());
            item.setThumbnailUrl(extractThumbnail(r.getContent()));
            return item;
        }).toList();

        return new PostListResponse(posts, hasNext);
    }

    private List<String> extractAllImageUrls(String content) {
        List<String> urls = new ArrayList<>();
        if (content == null || content.isBlank()) return urls;
        try {
            collectImages(objectMapper.readTree(content), urls);
        } catch (Exception ignored) {}
        return urls;
    }

    private void collectImages(JsonNode node, List<String> urls) {
        if (node.isObject()) {
            if ("image".equals(node.path("type").asText()) && node.has("src")) {
                urls.add(node.path("src").asText());
            }
            for (JsonNode child : node) collectImages(child, urls);
        } else if (node.isArray()) {
            for (JsonNode child : node) collectImages(child, urls);
        }
    }

    private String extractThumbnail(String content) {
        List<String> urls = extractAllImageUrls(content);
        return urls.isEmpty() ? null : urls.get(0);
    }

    private String extractSummary(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            StringBuilder sb = new StringBuilder();
            collectText(objectMapper.readTree(content), sb);
            String text = sb.toString().trim();
            return text.isEmpty() ? null : text;
        } catch (Exception ignored) {
            return null;
        }
    }

    private void collectText(JsonNode node, StringBuilder sb) {
        if (node.isObject()) {
            if ("text".equals(node.path("type").asText()) && node.has("text")) {
                String text = node.path("text").asText();
                if (!text.isBlank()) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(text);
                }
            }
            for (JsonNode child : node) collectText(child, sb);
        } else if (node.isArray()) {
            for (JsonNode child : node) collectText(child, sb);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
