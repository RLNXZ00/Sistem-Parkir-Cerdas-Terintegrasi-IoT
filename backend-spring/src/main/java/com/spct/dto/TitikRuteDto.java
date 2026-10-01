package com.spct.dto;

public class TitikRuteDto {
    private String id;
    private Double x;
    private Double y;

    public TitikRuteDto(String id, Double x, Double y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    public TitikRuteDto() {}

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public Double getX() {
        return x;
    }

    public void setY(Double y) {
        this.y = y;
    }

    public Double getY() {
        return y;
    }
}
