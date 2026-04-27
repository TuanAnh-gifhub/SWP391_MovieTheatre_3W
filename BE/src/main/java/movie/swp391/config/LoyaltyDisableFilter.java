package movie.swp391.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Temporary filter to disable Loyalty-related API endpoints by returning 410 Gone.
 * This approach avoids removing many backend classes/tables and is reversible.
 */
@Component
public class LoyaltyDisableFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Only filter loyalty endpoints
        return !(path.startsWith("/api/loyalty-tier") || path.startsWith("/api/loyalty-rule"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Return 410 Gone with a small JSON body explaining the removal
        response.setStatus(HttpServletResponse.SC_GONE); // 410
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String msg = "{ \"status\": 410, \"message\": \"Loyalty feature has been removed. Endpoint disabled.\" }";
        response.getWriter().write(msg);
        response.getWriter().flush();
    }
}

