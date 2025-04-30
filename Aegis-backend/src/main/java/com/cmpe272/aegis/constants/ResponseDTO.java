package com.cmpe272.aegis.constants;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
public class ResponseDTO<T> implements Serializable {

    private int code;

    public String msg;

    public T data;

    public ResponseDTO(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }


    public static <T> ResponseDTO<T> ok(T data) {
        return new ResponseDTO<>(HTTPCode.SUCCESS.getCode(),"Request successfully", data);
    }

    public static ResponseDTO<String> ok() {
        return new ResponseDTO<>(HTTPCode.SUCCESS.getCode(),"Request successfully", null);
    }

    public static <T> ResponseDTO<T> ok(String msg, T data) {
        return new ResponseDTO<>(HTTPCode.SUCCESS.getCode(), msg, data);
    }

    public static <T> ResponseDTO<T> error() {
        return new ResponseDTO<>(HTTPCode.INTERNAL_ERROR.getCode(), null, null);
    }
    public static <T> ResponseDTO<T> error(HTTPCode HTTPCode) {
        return new ResponseDTO<>(HTTPCode.getCode(), null, null);
    }

    public static <T> ResponseDTO<T> error(HTTPCode code, String msg) {
        return new ResponseDTO<>(code.getCode(), msg, null);
    }

    public static <T>ResponseDTO<T> fail(HTTPCode code, String msg) {
        return new ResponseDTO<>(code.getCode(), msg, null);
    }

    public static <T>ResponseDTO<T> fail(HTTPCode code) {
        return new ResponseDTO<>(code.getCode(), code.getDescription(), null);
    }


}
