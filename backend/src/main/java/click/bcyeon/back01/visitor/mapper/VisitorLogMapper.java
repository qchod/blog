package click.bcyeon.back01.visitor.mapper;

import click.bcyeon.back01.visitor.dto.VisitorLogDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface VisitorLogMapper {

    void insertVisitorLog(VisitorLogDto dto);
}
