package click.bcyeon.back01.restapi.post.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PostListResponse {
    private List<PostListItemDto> posts;
    private boolean hasNext;
}
