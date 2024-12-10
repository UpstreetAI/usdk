/**
 * This allows mouse events to pass through transparent elements by
 * checking the alpha value of the pixel at the mouse position and
 * setting the ignoreMouseEvents property of the window accordingly.
 */
async function updateIgnoreMouseEvents( win ) {
  const
    point = screen.getCursorScreenPoint(),
    [ x, y ] = win.getPosition(),
    [ w, h ] = win.getSize()

  // Ignore out-of-bounds events.
  if (
    point.x > x
    && point.x < x + w
    && point.y > y
    && point.y < y + h
  ) {

    // Capture 1x1 image of mouse position.
    const image = await win.webContents.capturePage({
      x: point.x - x,
      y: point.y - y,
      width: 1,
      height: 1,
    })

    // Set ignore mouse events according to alpha.
    win.setIgnoreMouseEvents( !image.getBitmap()[3])
  }
}