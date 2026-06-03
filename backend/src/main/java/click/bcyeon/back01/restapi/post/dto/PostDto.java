package click.bcyeon.back01.restapi.post.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class PostDto {
    private int id;
    private String title;
    private String content;
    private Date createdAt;
    private Date updatedAt;
    private boolean isDeleted;
    private List<PostFileDto> files;
}
