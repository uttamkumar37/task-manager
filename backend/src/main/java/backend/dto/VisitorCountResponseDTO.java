package backend.dto;

public class VisitorCountResponseDTO {

    private long count;

    public VisitorCountResponseDTO() {
    }

    public VisitorCountResponseDTO(long count) {
        this.count = count;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
