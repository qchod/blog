package click.bcyeon.back01.restapi.post.dto;

import lombok.Data;

import java.util.Date;

@Data
public class PostFileDto {
    private int id;
    private int postId;
    private String originalName;
    private String savedName;
    private String fileType;
    private String fileUrl;
    private Date createdAt;
}
