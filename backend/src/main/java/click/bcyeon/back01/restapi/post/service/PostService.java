package click.bcyeon.back01.restapi.post.service;

import click.bcyeon.back01.restapi.post.dto.PostDto;
import click.bcyeon.back01.restapi.post.dto.PostFileDto;
import click.bcyeon.back01.restapi.post.mapper.PostMapper;
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

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
