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

    // Conditionally render Remove Image button if image is already uploaded 
    if (image) {
        return (
            <button onClick={() => setImage(null)} className="remove-btn">Remove Image</button>
        );
    }

    return (
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
    );
}