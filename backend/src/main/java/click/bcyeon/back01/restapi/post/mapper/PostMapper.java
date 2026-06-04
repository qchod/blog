package click.bcyeon.back01.restapi.post.mapper;

import click.bcyeon.back01.restapi.post.dto.PostDto;
import click.bcyeon.back01.restapi.post.dto.PostFileDto;
import click.bcyeon.back01.restapi.post.dto.PostListRawDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostMapper {

    void insertPost(PostDto postDto);

    void insertPostFile(PostFileDto postFileDto);

    List<PostListRawDto> selectPostList(@Param("lastId") int lastId, @Param("size") int size);

    PostDto selectPost(int id);

    List<PostFileDto> selectPostFiles(int postId);

    void deletePostFiles(int postId);

    void softDeletePost(int id);
}
