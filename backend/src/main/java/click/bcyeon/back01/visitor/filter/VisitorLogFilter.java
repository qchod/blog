package click.bcyeon.back01.visitor.filter;

import click.bcyeon.back01.visitor.service.VisitorLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;

@Component
public class VisitorLogFilter extends OncePerRequestFilter {

    @Autowired
    private VisitorLogService visitorLogService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            visitorLogService.log(
                    getClientIp(request),
                    request.getRequestURI(),
                    request.getMethod(),
                    response.getStatus(),
                    System.currentTimeMillis() - start,
                    request.getHeader("User-Agent"),
                    request.getHeader("Referer"),
                    new Date()
            );
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String[] headers = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
