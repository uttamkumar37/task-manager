package backend.dto;

public class VisitorMessageResponseDTO {

    private String name;
    private String socialHandle;
    private String message;
    private String submittedBy;

    public VisitorMessageResponseDTO() {
    }

    public VisitorMessageResponseDTO(String name, String socialHandle, String message, String submittedBy) {
        this.name = name;
        this.socialHandle = socialHandle;
        this.message = message;
        this.submittedBy = submittedBy;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSocialHandle() {
        return socialHandle;
    }

    public void setSocialHandle(String socialHandle) {
        this.socialHandle = socialHandle;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }
}
