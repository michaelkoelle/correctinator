package com.koellemichael.controller;

import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.geometry.Point2D;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseEvent;
import javafx.scene.input.ScrollEvent;
import javafx.scene.input.ZoomEvent;
import javafx.scene.layout.StackPane;

public class ImageViewController {

    private static final int MIN_PIXELS = 10;
    private ImageView imageView;
    public StackPane pane;
    private ObjectProperty<Point2D> mouseDown;
    private Image image;

    public void initialize(Image image){
        imageView = new ImageView();
        imageView.setPreserveRatio(true);

        mouseDown = new SimpleObjectProperty<>();

        pane.getChildren().clear();
        pane.getChildren().add(imageView);
        imageView.fitWidthProperty().bind(pane.widthProperty());
        imageView.fitHeightProperty().bind(pane.heightProperty());

        reset(imageView, image.getWidth(), image.getHeight());
        
        this.image = new Image(image.getUrl(), pane.getPrefWidth(),0,true,true);
        imageView.setImage(this.image);

        imageView.setOnMousePressed(this::handleMousePressed);
        imageView.setOnMouseDragged(this::handleMouseDragged);
        imageView.setOnScroll(this::handleScroll);
        imageView.setOnMouseClicked(this::handleMouseClicked);
        imageView.setOnZoom(this::handleZoom);
    }

    private void reset(ImageView imageView, double width, double height) {
        imageView.setViewport(new Rectangle2D(0, 0, width, height));
    }

    // shift the viewport of the imageView by the specified delta, clamping so
    // the viewport does not move off the actual image:
    private void shift(ImageView imageView, Point2D delta) {
        Rectangle2D viewport = imageView.getViewport();
        double width = imageView.getImage().getWidth();
        double height = imageView.getImage().getHeight();

        double maxX = viewport.getWidth()/2;
        double maxY = viewport.getHeight()/2;
        double minX = clamp(viewport.getMinX() - delta.getX(), -maxX, width-maxX);
        double minY = clamp(viewport.getMinY() - delta.getY(), -maxY, height-maxY);

        imageView.setViewport(new Rectangle2D(minX, minY, viewport.getWidth(), viewport.getHeight()));
    }

    private double clamp(double value, double min, double max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    }

    // convert mouse coordinates in the imageView to coordinates in the actual image:
    private Point2D imageViewToImage(ImageView imageView, Point2D imageViewCoordinates) {
        double xProportion = imageViewCoordinates.getX() / imageView.getBoundsInLocal().getWidth();
        double yProportion = imageViewCoordinates.getY() / imageView.getBoundsInLocal().getHeight();

        Rectangle2D viewport = imageView.getViewport();
        return new Point2D(
                viewport.getMinX() + xProportion * viewport.getWidth(),
                viewport.getMinY() + yProportion * viewport.getHeight());
    }

    public void handleMousePressed(MouseEvent e) {
        Point2D mousePress = imageViewToImage(imageView, new Point2D(e.getX(), e.getY()));
        mouseDown.set(mousePress);
    }

    public void handleMouseClicked(MouseEvent e) {
        if (e.getClickCount() == 2) {
            zoomAtPos(-100, new Point2D(e.getX(),e.getY()));
        }
    }

    public void handleMouseDragged(MouseEvent e) {
        Point2D dragPoint = imageViewToImage(imageView, new Point2D(e.getX(), e.getY()));
        shift(imageView, dragPoint.subtract(mouseDown.get()));
        mouseDown.set(imageViewToImage(imageView, new Point2D(e.getX(), e.getY())));
    }

    public void zoomAtPos(double delta, Point2D e){
        Rectangle2D viewport = imageView.getViewport();

        double scale = clamp(Math.pow(1.005, delta),
                // don't scale so we're zoomed in to fewer than MIN_PIXELS in any direction:
                Math.min(MIN_PIXELS / viewport.getWidth(), MIN_PIXELS / viewport.getHeight()),
                // don't scale so that we're bigger than image dimensions:
                Math.max(image.getWidth() / viewport.getWidth(), image.getHeight() / viewport.getHeight())
        );

        if (scale != 1.0) {
            Point2D mouse = imageViewToImage(imageView, new Point2D(e.getX(), e.getY()));

            double newWidth = viewport.getWidth() * scale;
            double newHeight = viewport.getHeight() * scale;

            // To keep the visual point under the mouse from moving, we need
            // (x - newViewportMinX) / (x - currentViewportMinX) = scale
            // where x is the mouse X coordinate in the image
            // solving this for newViewportMinX gives
            // newViewportMinX = x - (x - currentViewportMinX) * scale
            // we then clamp this value so the image never scrolls out
            // of the imageview:

            double newMinX = 0;
            if (newWidth < image.getWidth()) {
                newMinX = clamp(mouse.getX() - (mouse.getX() - viewport.getMinX()) * scale,
                        0, image.getWidth() - newWidth);
            }
            double newMinY = 0;
            if (newHeight < image.getHeight()) {
                newMinY = clamp(mouse.getY() - (mouse.getY() - viewport.getMinY()) * scale,
                        0, image.getHeight() - newHeight);
            }

            imageView.setViewport(new Rectangle2D(newMinX, newMinY, newWidth, newHeight));

        }
    }

    public void zoomAtPosScale(double scale, Point2D e){
        Rectangle2D viewport = imageView.getViewport();

        if (scale != 1.0) {
            Point2D mouse = imageViewToImage(imageView, new Point2D(e.getX(), e.getY()));

            double newWidth = viewport.getWidth() * scale;
            double newHeight = viewport.getHeight() * scale;

            // To keep the visual point under the mouse from moving, we need
            // (x - newViewportMinX) / (x - currentViewportMinX) = scale
            // where x is the mouse X coordinate in the image
            // solving this for newViewportMinX gives
            // newViewportMinX = x - (x - currentViewportMinX) * scale
            // we then clamp this value so the image never scrolls out
            // of the imageview:

            double newMinX = 0;
            if (newWidth < image.getWidth()) {
                newMinX = clamp(mouse.getX() - (mouse.getX() - viewport.getMinX()) * scale,
                        0, image.getWidth() - newWidth);
            }
            double newMinY = 0;
            if (newHeight < image.getHeight()) {
                newMinY = clamp(mouse.getY() - (mouse.getY() - viewport.getMinY()) * scale,
                        0, image.getHeight() - newHeight);
            }

            imageView.setViewport(new Rectangle2D(newMinX, newMinY, newWidth, newHeight));

        }
    }

    public void handleScroll(ScrollEvent e){
        double delta = -e.getDeltaY();
        zoomAtPos(delta, new Point2D(e.getX(), e.getY()));
    }

    public void handleZoom(ZoomEvent e){
        double scale = (2-e.getZoomFactor());
        zoomAtPosScale(scale, new Point2D(e.getX(), e.getY()));
    }
}
