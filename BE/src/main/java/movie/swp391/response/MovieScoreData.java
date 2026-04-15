package movie.swp391.response;


import movie.swp391.entity.Movie;


public class MovieScoreData {
    private Movie movie;
    private double adjustedScore;
    public double ideal;
    public int floor;
    public double remainder;

    public MovieScoreData(Movie movie, double adjustedScore) {
        this.movie = movie;
        this.adjustedScore = adjustedScore;
    }

    public Movie getMovie() {
        return movie;
    }

    public double getAdjustedScore() {
        return adjustedScore;
    }
}