interface Props {
    ratioW: number;
    ratioH: number;
    setRatioW: (val: number) => void;
    setRatioH: (val: number) => void;
}

export default function CardRatio({ ratioW, ratioH, setRatioW, setRatioH }: Props) {
    return (
        <div className="ratio-input">
            <label>Card ratio</label>
            <input
                type="number"
                min={1}
                value={ratioW}
                onChange={e => setRatioW(Math.max(1, Number(e.target.value)))}
            />
            <span>:</span>
            <input
                type="number"
                min={1}
                value={ratioH}
                onChange={e => setRatioH(Math.max(1, Number(e.target.value)))}
            />
        </div>
    );
}
