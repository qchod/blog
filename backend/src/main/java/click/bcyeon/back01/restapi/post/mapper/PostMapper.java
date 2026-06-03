package click.bcyeon.back01.restapi.post.mapper;

import click.bcyeon.back01.restapi.post.dto.PostDto;
import click.bcyeon.back01.restapi.post.dto.PostFileDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PostMapper {

    void insertPost(PostDto postDto);

    void insertPostFile(PostFileDto postFileDto);
}
