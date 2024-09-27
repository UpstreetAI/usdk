/**
 * Format SVG files for SVGR ( remove style, classname and fill attributes )
 * @author Hayk Mavisakalyan
 */

const tempIconsDirectoryName = 'tempIcons';
const iconsDirectoryName = 'assets/icons';

const fs = require( 'fs' ).promises
const path = require( 'path' )

async function formatAndSaveSvgFiles( dir, file ) {
  const { readFileSync, writeFileSync } = require( 'fs' );

  const svgFile = readFileSync( dir, 'utf8', function ( err, data ) {
    if ( err ) throw err;
    return data
  } );
  const cleanSvg =
    await svgFile.replaceAll( /style=".*?"/gm, '' )
      .replaceAll( /fill=".*?"/gm, '' )
      .replaceAll( /<style.*?<\/style>/gis, '' )

  writeFileSync( `assets/${tempIconsDirectoryName}/${file}`, cleanSvg, 'utf-8', function ( err ) {
    if ( err ) throw err;
    console.log( 'filelistAsync complete' );
  } );
}

async function walk( dir, fileList = [] ) {
  const files = await fs.readdir( dir );
  fs.mkdir( path.join( 'assets/', tempIconsDirectoryName ),
    ( err ) => {
      if ( err ) {
        return console.error( err );
      }
      console.log( 'Temporary directory for icons created successfully!' );
    } );
  for ( const file of files ) {
    if ( file.split( '.' ).pop() === 'svg' ) {
      const fileDir = path.join( dir, file );
      const stat = await fs.stat( path.join( dir, file ) )
      if ( stat.isDirectory() ) fileList = await walk( path.join( dir, file ), fileList )
      else await formatAndSaveSvgFiles( fileDir, file );
    }
  }
}

walk( iconsDirectoryName ).then( ( res ) => {
  console.log( "All SVG files were formatted successfully." );
} )