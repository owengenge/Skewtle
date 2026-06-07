interface Props {
    image: HTMLImageElement | null;
    setImage: (img: HTMLImageElement | null) => void;
};

export default function UploadImage ({ image, setImage }: Props) {
    // Create new Image object and setImage
    function handleUpload(file: File) {
        const img: HTMLImageElement = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(file);
    }

    // Conditionally render Clear Image button if image is already uploaded 
    if (image) {
        return (
            <button onClick={() => setImage(null)} className="clear-btn">Clear</button>
        );
    }

    return (

        <>
            <p className="upload-tip-callout">
                For best results, the card should be flat in the image with some background visible around all edges. Higher image quality will produce a cleaner output.
            </p>
            <div
                className="upload-img-div"
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith("image/")) { handleUpload(file); }
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <p>Drag and drop image or select from your device</p>
                <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }} />
            </div>
        </>
    );
}