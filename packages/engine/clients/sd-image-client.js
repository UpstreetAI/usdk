import {
  loadImage,
} from '../../gen/utils.js';

const baseUrl = `https://stable-diffusion.webaverse.com/`;

export const txt2img = async ({
  prompt = 'test',
  negativePrompt = '',
  width = 512,
  height = 512,
} = {}) => {
/*
 : string, // represents text string of 'Prompt' Textbox component
 : string, // represents text string of 'Negative prompt' Textbox component
 : string, // represents selected choice of 'Style 1' Dropdown component
 : string, // represents selected choice of 'Style 2' Dropdown component
 : number, // represents selected value of 'Sampling Steps' Slider component
 : string, // represents selected choice of 'Sampling method' Radio component
 : boolean, // represents checked status of 'Restore faces' Checkbox component
 : boolean, // represents checked status of 'Tiling' Checkbox component
 : number, // represents selected value of 'Batch count' Slider component
 : number, // represents selected value of 'Batch size' Slider component
 : number, // represents selected value of 'CFG Scale' Slider component
 : number, // represents numeric value of 'Seed' Number component
 : number, // represents numeric value of 'Variation seed' Number component
 : number, // represents selected value of 'Variation strength' Slider component
 : number, // represents selected value of 'Resize seed from height' Slider component
 : number, // represents selected value of 'Resize seed from width' Slider component
 : boolean, // represents checked status of 'Extra' Checkbox component
 : number, // represents selected value of 'Height' Slider component
 : number, // represents selected value of 'Width' Slider component
 : boolean, // represents checked status of 'Highres. fix' Checkbox component
 : number, // represents selected value of 'Denoising strength' Slider component
 : number, // represents selected value of 'Firstpass width' Slider component
 : number, // represents selected value of 'Firstpass height' Slider component
 : string, // represents selected choice of 'Script' Dropdown component
 : boolean, // represents checked status of 'Put variable parts at start of prompt' Checkbox component
 : boolean, // represents checked status of 'Iterate seed every line' Checkbox component
 : boolean, // represents checked status of 'Use same random seed for all lines' Checkbox component
 : string, // represents text string of 'List of prompt inputs' Textbox component
 : string, // represents selected choice of 'X type' Dropdown component
 : string, // represents text string of 'X values' Textbox component
 : string, // represents selected choice of 'Y type' Dropdown component
 : string, // represents text string of 'Y values' Textbox component
 : boolean, // represents checked status of 'Draw legend' Checkbox component
 : boolean, // represents checked status of 'Include Separate Images' Checkbox component
 : boolean, // represents checked status of 'Keep -1 for seeds' Checkbox
*/
  const res = await fetch(`${baseUrl}run/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3" },
    body: JSON.stringify({
      data: [
        prompt, // prompt
        negativePrompt, // negative prompt
        "None", // style 1
        "None", // style 2
        20, // sampling steps
        "Euler a", // sampling method
        false, // restore faces
        false, // tiling
        1, // batch count
        1, // batch size
        7, // cfg scale
        -1, // seed
        -1, // variation seed
        0, // variation strength
        0, // resize seed from height
        0, // resize seed from width
        false, // extra
        height, // height
        width, // width
        false, // highres fix
        0.7, // denoising strength
        0, // firstpass width
        0, // firstpass height
        "None", // script
        false, // put variable parts at start of prompt
        false, // iterate seed every line
        false, // use same random seed for all lines
        prompt, // list of prompt inputs
        "Nothing", // x type
        "", // x values
        "Nothing", // y type
        "", // y values
        true, // draw legend
        false, // include separate images
        false, // keep -1 for seeds
    ]
  })})
  const r = await res.json();
  const data = r.data;
  const j = data[0][0];
  const {name} = j;
  const img = await loadImage(`${baseUrl}file=${name}`);
  // img.style.cssText = `\
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  // `;
  document.body.appendChild(img);
  return j;
};

//

export const img2img = async ({
  prompt = 'test',
  negativePrompt = '',
  width = 512,
  height = 512,
  imageDataUrl = '',
  maskImageDataUrl = '',
  maskBlur = 4, // default 4
  maskTransparency = 0,
  falloffExponent = 1, // default 1
  randomness = 0, // default 0
} = {}) => {
  // console.log('img2img', {
  //   prompt,
  //   negativePrompt,
  //   width,
  //   height,
  //   imageDataUrl,
  //   maskImageDataUrl,
  //   maskBlur,
  //   maskTransparency,
  //   falloffExponent,
  //   randomness,
  // });

  /*
 : { label: string; confidences?: Array<{ label: string; confidence: number }>, // represents output label and optional set of confidences per label of the Label component
 : string, // represents text string of 'Prompt' Textbox component
 : string, // represents text string of 'Negative prompt' Textbox component
 : string, // represents selected choice of 'Style 1' Dropdown component
 : string, // represents selected choice of 'Style 2' Dropdown component
 : string, // represents image data as base64 string of 'Image for img2img' Image component
 : string, // represents image data as base64 string of 'Image for inpainting with mask' Image component
 : Any, // represents stored state value of the State component
 : string, // represents image data as base64 string of 'Image for img2img' Image component
 : string, // represents image data as base64 string of 'Mask' Image component
 : string, // represents selected choice of 'Mask mode' Radio component
 : number, // represents selected value of 'Sampling Steps' Slider component
 : string, // represents selected choice of 'Sampling method' Radio component
 : number, // represents selected value of 'Mask blur' Slider component
 : number, // represents selected value of 'Mask transparency' Slider component
 : string, // represents selected choice of 'Masked content' Radio component
 : boolean, // represents checked status of 'Restore faces' Checkbox component
 : boolean, // represents checked status of 'Tiling' Checkbox component
 : number, // represents selected value of 'Batch count' Slider component
 : number, // represents selected value of 'Batch size' Slider component
 : number, // represents selected value of 'CFG Scale' Slider component
 : number, // represents selected value of 'Denoising strength' Slider component
 : number, // represents numeric value of 'Seed' Number component
 : number, // represents numeric value of 'Variation seed' Number component
 : number, // represents selected value of 'Variation strength' Slider component
 : number, // represents selected value of 'Resize seed from height' Slider component
 : number, // represents selected value of 'Resize seed from width' Slider component
 : boolean, // represents checked status of 'Extra' Checkbox component
 : number, // represents selected value of 'Height' Slider component
 : number, // represents selected value of 'Width' Slider component
 : string, // represents selected choice of 'Resize mode' Radio component
 : boolean, // represents checked status of 'Inpaint at full resolution' Checkbox component
 : number, // represents selected value of 'Inpaint at full resolution padding, pixels' Slider component
 : string, // represents selected choice of 'Masking mode' Radio component
 : string, // represents text string of 'Input directory' Textbox component
 : string, // represents text string of 'Output directory' Textbox component
 : string, // represents selected choice of 'Script' Dropdown component
 : string, // represents HTML rendering of markdown of the Markdown component
 : boolean, // represents checked status of 'Override `Sampling method` to Euler?(this method is built for it)' Checkbox component
 : boolean, // represents checked status of 'Override `prompt` to the same value as `original prompt`?(and `negative prompt`)' Checkbox component
 : string, // represents text string of 'Original prompt' Textbox component
 : string, // represents text string of 'Original negative prompt' Textbox component
 : boolean, // represents checked status of 'Override `Sampling Steps` to the same value as `Decode steps`?' Checkbox component
 : number, // represents selected value of 'Decode steps' Slider component
 : boolean, // represents checked status of 'Override `Denoising strength` to 1?' Checkbox component
 : number, // represents selected value of 'Decode CFG scale' Slider component
 : number, // represents selected value of 'Randomness' Slider component
 : boolean, // represents checked status of 'Sigma adjustment for finding noise for image' Checkbox component
 : number, // represents selected value of 'Loops' Slider component
 : number, // represents selected value of 'Denoising strength change factor' Slider component
 : string, // represents HTML output of the Html component
 : number, // represents selected value of 'Pixels to expand' Slider component
 : number, // represents selected value of 'Mask blur' Slider component
 : Array<string>, // represents list of selected choices of 'Outpainting direction' Checkboxgroup component
 : number, // represents selected value of 'Fall-off exponent (lower=higher detail)' Slider component
 : number, // represents selected value of 'Color variation' Slider component
 : number, // represents selected value of 'Pixels to expand' Slider component
 : number, // represents selected value of 'Mask blur' Slider component
 : string, // represents selected choice of 'Masked content' Radio component
 : Array<string>, // represents list of selected choices of 'Outpainting direction' Checkboxgroup component
 : boolean, // represents checked status of 'Put variable parts at start of prompt' Checkbox component
 : boolean, // represents checked status of 'Iterate seed every line' Checkbox component
 : boolean, // represents checked status of 'Use same random seed for all lines' Checkbox component
 : string, // represents text string of 'List of prompt inputs' Textbox component
 : string, // represents HTML output of the Html component
 : number, // represents selected value of 'Tile overlap' Slider component
 : string, // represents selected choice of 'Upscaler' Radio component
 : string, // represents selected choice of 'X type' Dropdown component
 : string, // represents text string of 'X values' Textbox component
 : string, // represents selected choice of 'Y type' Dropdown component
 : string, // represents text string of 'Y values' Textbox component
 : boolean, // represents checked status of 'Draw legend' Checkbox component
 : boolean, // represents checked status of 'Include Separate Images' Checkbox component
 : boolean, // represents checked status of 'Keep -1 for seeds' Checkbox
*/
  const pixelsToExpand = 128;
  const res = await fetch(`${baseUrl}run/img2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
          1, // confidence
          prompt, // prompt
          negativePrompt, // negative prompt
          "None", // style 1
          "None", // style 2
          null, // image for img2img
          null, // image for inpainting with mask
          null, // state
          imageDataUrl, // image for img2img
          maskImageDataUrl, // mask
          "Upload mask", // mask mode
          20, // sampling steps
          "Euler a", // sampling method
          maskBlur, // mask blur
          maskTransparency, // mask transparency
          "original", // masked content {"fill", "original", "latent noise", "latent nothing"}
          false, // restore faces
          false, // tiling
          1, // batch count
          1, // batch size
          7, // cfg scale
          0.75, // denoising strength
          -1, // seed
          -1, // variation seed
          0, // variation strength
          0, // resize seed from height
          0, // resize seed from width
          false, // extra
          height, // height
          width, // width
          "Just resize", // resize mode
          false, // inpaint at full resolution
          32, // inpaint at full resolution padding, pixels
          "Inpaint masked", // masking mode
          "", // input directory
          "", // output directory
          "None", // script
          "<ul>\n<li><code>CFG Scale</code> should be 2 or lower.</li>\n</ul>\n", // markdown
          true, // override `Sampling method` to Euler?(this method is built for it)
          true, // override `prompt` to the same value as `original prompt`?(and `negative prompt`)
          "", // original prompt
          "", // original negative prompt
          true, // override `Sampling Steps` to the same value as `Decode steps`?
          50, // decode steps
          true, // override `Denoising strength` to 1?
          1, // decode CFG scale
          randomness, // randomness
          false, // sigma adjustment for finding noise for image
          4, // loops
          1, // denoising strength change factor
          "<p style=\"margin-bottom:0.75em\">Recommended settings: Sampling Steps: 80-100, Sampler: Euler a, Denoising strength: 0.8</p>", // html
          pixelsToExpand, // pixels to expand
          maskBlur, // mask blur
          [ // outpainting direction
            "left",
            "right",
            "up",
            "down"
          ],
          falloffExponent, // fall-off exponent (lower=higher detail)
          0.05, // color variation
          pixelsToExpand, // pixels to expand
          maskBlur, // mask blur
          "fill", // masked content
          [ // outpainting direction
            "left",
            "right",
            "up",
            "down"
          ],
          false, // put variable parts at start of prompt
          false, // iterate seed every line
          false, // use same random seed for all lines
          "", // list of prompt inputs
          "<p style=\"margin-bottom:0.75em\">Will upscale the image to twice the dimensions; use width and height sliders to set tile size</p>", // html
          64, // tile overlap
          "None", // upscaler
          "Seed", // x type
          "", // x values
          "Nothing", // y type
          "", // y values
          true, // draw legend
          false, // include separate images
          false, // keep -1 for seeds
          // null, // image for inpainting with mask
          // // "{\"prompt\": \"anime\", \"all_prompts\": [\"anime\"], \"negative_prompt\": \"\", \"all_negative_prompts\": [\"\"], \"seed\": 3183593457, \"all_seeds\": [3183593457], \"subseed\": 1599988678, \"all_subseeds\": [1599988678], \"subseed_strength\": 0, \"width\": 512, \"height\": 512, \"sampler_name\": \"Euler a\", \"cfg_scale\": 7, \"steps\": 20, \"batch_size\": 1, \"restore_faces\": false, \"face_restoration_model\": null, \"sd_model_hash\": \"779e99ba\", \"seed_resize_from_w\": 0, \"seed_resize_from_h\": 0, \"denoising_strength\": 0.75, \"extra_generation_params\": {\"Mask blur\": 4}, \"index_of_first_image\": 0, \"infotexts\": [\"anime\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 3183593457, Size: 512x512, Model hash: 779e99ba, Denoising strength: 0.75, Mask blur: 4\"], \"styles\": [\"None\", \"None\"], \"job_timestamp\": \"20221205030835\", \"clip_skip\": 1, \"is_using_inpainting_conditioning\": false}",
          // // "<p>anime<br>\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 3183593457, Size: 512x512, Model hash: 779e99ba, Denoising strength: 0.75, Mask blur: 4</p><div class='performance'><p class='time'>Time taken: <wbr>1.34s</p><p class='vram'>Torch active/reserved: 3162/3694 MiB, <wbr>Sys VRAM: 5108/48686 MiB (10.49%)</p></div>"
    ]
  })})
  const r = await res.json();
  const data = r.data;
  const j = data[0][0];
  const {name} = j;
  const img = await loadImage(`${baseUrl}file=${name}`);
  // img.style.cssText = `\
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  // `;
  document.body.appendChild(img);
  // return j;
  return img;
};

export const new_img_inpainting = async ({
                                             prompt = 'test',
                                             negativePrompt = '',
                                             width = 512,
                                             height = 512,
                                             ImgDataUrl = "",
                                             maskDataUrl = "",
                                             seed = -1,
                                         } = {}) => {
    const res = await fetch(`${baseUrl}sdapi/v1/img2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
                "init_images": [
                    ImgDataUrl
                ],
                "resize_mode": 0,
                "denoising_strength": 0.75,
                "mask": maskDataUrl,
                "mask_blur": 4,
                "inpainting_fill": 2,
                "inpaint_full_res": true,
                "inpaint_full_res_padding": 32,
                "inpainting_mask_invert": 0,
                "prompt": prompt,
                "styles": [
                    ""
                ],
                "seed": seed,
                "subseed": -1,
                "subseed_strength": 0,
                "seed_resize_from_h": -1,
                "seed_resize_from_w": -1,
                "sampler_name": "Euler a",
                "batch_size": 1,
                "n_iter": 1,
                "steps": 20,
                "cfg_scale": 7.5,
                "width": 512,
                "height": 512,
                "restore_faces": false,
                "tiling": false,
                "negative_prompt": negativePrompt,
                "eta": 0,
                "s_churn": 0,
                "s_tmax": 0,
                "s_tmin": 0,
                "s_noise": 1,
                "override_settings": {},
                "include_init_images": true,
            }
        )}
    )
    const r = await res.json();
    const images = r.images;
    const base64img= images[0];
    const img = new Image();
    img.src = "data:image/png;base64,"+base64img;
    // document.body.appendChild(img);
    return img;
};