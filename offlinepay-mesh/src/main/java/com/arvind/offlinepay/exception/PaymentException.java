package com.arvind.offlinepay.exception;

/**
 * Custom exception for payment processing failures.
 * Carries a machine-readable error code alongside the human-readable message.
 *
 * @author Arvind Dwivedi
 */
public class PaymentException extends RuntimeException {

    private final String errorCode;

    public PaymentException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public PaymentException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
