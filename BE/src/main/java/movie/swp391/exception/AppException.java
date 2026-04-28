package movie.swp391.exception;

public class AppException extends RuntimeException {

    private final ErrorHandler errorCode;
    private final String customMessage;

    public AppException(ErrorHandler errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    public AppException(ErrorHandler errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    public ErrorHandler getErrorCode() {
        return errorCode;
    }

    public String getCustomMessage() {
        return customMessage;
    }
}
