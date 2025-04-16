package com.cmpe272.aegis.constants;

public enum ManagerErrorCode {
    /**
     *
     */
    SUCCESS("OK","succeed"),

    PARAM_ERROR("300001", "parameter error"),

    ALREADY_EXIST("300002", "data already existed"),

    RESUBMIT_ERROR("300003", "data resubmitted"),

    NO_LOGIN_ERROR("300004", "not login yet"),

    MANAGE_ACCOUNT_ERROR("300005", "account not found"),

    MANAGE_ACCOUNT_PWD_ERROR("300006", "wrong password"),

    MANAGE_ACCOUNT_PWD2_ERROR("300007", "2 passwords not the same"),

    INVALID_VERIFICATION_CODE("300008", "registration code expired"),
    ;

    private final String code;

    public final String description;

    ManagerErrorCode(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
