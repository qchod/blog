package click.bcyeon.back01.restapi.post.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PostListRawDto {
    private int id;
    private String title;
    private String content;
    private Date createdAt;
}
