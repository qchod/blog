package click.bcyeon.back01.restapi.post.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PostListItemDto {
    private int id;
    private String title;
    private Date createdAt;
    private String thumbnailUrl;
}
