package movie.swp391.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {
    
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
    
    // Xử lý tất cả các route SPA - tránh forward các file tĩnh và API
    @GetMapping(value = {"/{path:^(?!api|swagger-ui|v3|error|assets|static|favicon\\.ico|index\\.html|.*\\..*).*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}


