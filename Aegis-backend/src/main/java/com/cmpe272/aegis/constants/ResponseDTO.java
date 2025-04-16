package com.cmpe272.aegis.constants;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class ResponseDTO<T> implements Serializable {

    private String code;

    public String msg;

    public T data;

    public ResponseDTO(String code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }


    public static <T> ResponseDTO<T> ok() {
        return new ResponseDTO<>(ManagerErrorCode.SUCCESS.getCode(), ManagerErrorCode.SUCCESS.description, null);
    }

    public static <T> ResponseDTO<T> ok(T data) {
        return new ResponseDTO<>(ManagerErrorCode.SUCCESS.getCode(), ManagerErrorCode.SUCCESS.description,data);
    }

    public static <T> ResponseDTO<T> okMsg(String msg) {
        return new ResponseDTO<>(ManagerErrorCode.SUCCESS.getCode(),msg,null);
    }

    public static <T> ResponseDTO<T> error() {
        return new ResponseDTO<>(SystemErrorCode.SYSTEM_ERROR.getCode(), SystemErrorCode.SYSTEM_ERROR.getDescription(), null);
    }

    public static <T> ResponseDTO<T> error(ManagerErrorCode errorCode) {
        return new ResponseDTO<>(errorCode.getCode(), errorCode.getDescription(), null);
    }

    public static <T> ResponseDTO<T> error(ManagerErrorCode errorCode, String msg) {
        return new ResponseDTO<>(errorCode.getCode(),msg, null);
    }

    public static <T> ResponseDTO<T> error(SystemErrorCode errorCode) {
        return new ResponseDTO<>(errorCode.getCode(),errorCode.getDescription(), null);
    }


    public static <T> ResponseDTO<T> errorMsg(String errorCode, String msg) {
        return new ResponseDTO<>(errorCode, msg, null);
    }

}
