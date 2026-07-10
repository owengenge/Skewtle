interface Props {
    zoom: number;
    setZoom: (zoom: number) => void;
}

export default function ZoomSlider({ zoom, setZoom }: Props) {
    return (
        <div className="zoom-slider-div">
            <label>Drag Zoom</label>
            <p>{zoom}x</p>
            <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
            />
        </div>
    )
}