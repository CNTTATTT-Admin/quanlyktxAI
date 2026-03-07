package com.cntt.rentalmanagement.config;

import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

@ControllerAdvice
public class GlobalWebBindingConfig {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // nullAsEmpty = true: if the string is empty or only whitespace, it becomes null
        // nullAsEmpty = false: it stays an empty string after trimming
        // Usually, for web forms, we want it to be trimmed. 
        // We'll set it to false if you want empty strings to stay empty, 
        // or true if you want empty strings to become null.
        StringTrimmerEditor stringTrimmerEditor = new StringTrimmerEditor(false);
        binder.registerCustomEditor(String.class, stringTrimmerEditor);
    }
}
