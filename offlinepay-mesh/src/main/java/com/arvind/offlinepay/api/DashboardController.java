package com.arvind.offlinepay.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the interactive demo dashboard at the root URL.
 *
 * @author Arvind Dwivedi
 */
@Controller
public class DashboardController {

    @GetMapping("/")
    public String dashboard() {
        return "dashboard";
    }
}
