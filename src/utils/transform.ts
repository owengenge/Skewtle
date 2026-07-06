// @ts-ignore
import { Homography } from "homography";
import { OUTPUT_W, PAD } from '../constants';
import { getCropOffset } from './projective';

interface Params {
    srcPoints: [number, number][];
    dstPoints: [number, number][];
    image: HTMLImageElement;
    setWarpedImage: (img: HTMLImageElement) => void;
    cardRatio:number;
}

export async function transform({ srcPoints, dstPoints, image, setWarpedImage, cardRatio }: Params): Promise<void> {
    if (!image) return;

    // Set up projective transform 
    const homography = new Homography("projective");

    // Define source and destiny points 
    homography.setSourcePoints(srcPoints);
    homography.setDestinyPoints(dstPoints);
    homography.setImage(image);

    // apply the warp
    const imageData = homography.warp() as ImageData;

    // Draw full warped ImageData onto a canvas
    const full = document.createElement('canvas');
    full.width = imageData.width;
    full.height = imageData.height;
    full.getContext('2d')!.putImageData(imageData, 0, 0);

    // Compute where the card TL actually lands in the ImageData
    const { cropX, cropY } = getCropOffset(srcPoints, dstPoints, image.naturalWidth, image.naturalHeight);

    // Crop to card region with PAD breathing room on all sides
    const cropped = document.createElement('canvas');
    cropped.width = OUTPUT_W;
    const outputH = OUTPUT_W * cardRatio;
    cropped.height = outputH;
    const cropCtx = cropped.getContext('2d')!;
    cropCtx.imageSmoothingEnabled = true;
    cropCtx.imageSmoothingQuality = 'high';
    cropCtx.drawImage(
        full,
        cropX - PAD, cropY - PAD,         // source start (expanded outward)
        OUTPUT_W + PAD * 2, outputH + PAD * 2, // source region (wider + taller)
        0, 0,                              // destination start
        OUTPUT_W, outputH                 // destination size (scaled to fit)
    );

    // Convert to HTMLImageElement
    const img = new Image();
    img.src = cropped.toDataURL();
    await new Promise(resolve => img.onload = resolve);

    setWarpedImage(img);
}
