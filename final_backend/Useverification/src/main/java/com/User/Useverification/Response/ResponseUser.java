package com.User.Useverification.Response;

import lombok.*;

@Getter
@Setter
@Builder

public class ResponseUser {
    private String userName;
    private String email;

    public ResponseUser(String name, String email) {

        this.userName = name;

        this.email = email;

    }
}
