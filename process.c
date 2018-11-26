extern void print_int(int);


/**
 * Render the buffer in green (#00ff00ff)
 *
 */
int render(char *buffer, int width, int height) {

  int numPixels = width * height;

  for (int i = 0; i < numPixels * 4; i += 4) {
    buffer[i] = (char)0;
    buffer[i+1] = (char)255;
    buffer[i+2] = (char)0;
    buffer[i+3] = (char)255;

  }

  return 0;
}


/**
 * Calculate the average of the R, G, and B components to get a
 * grayscale intensity
 *
 */
int process(char *buffer, int width, int height) {
  int numPixels = width * height;

  for (int i = 0; i < numPixels * 4; i += 4) {
    int avg = (buffer[i] + buffer[i+1] + buffer[i+2]);
    avg = (int)(avg / 3);
    buffer[i] = (char)avg;
    buffer[i+1] = (char)avg;
    buffer[i+2] = (char)avg;
    buffer[i+3] = (char)255;
  }

  return 0;
}
