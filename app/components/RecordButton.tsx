type RecordButtonProps = {
    isRecording: boolean
    onStart: () => void
    onStop: () => void
}

export default function RecordButton({ isRecording, onStart, onStop }: RecordButtonProps) {

    const handleClick = isRecording ? onStop: onStart
    const label = isRecording ? "⏹️ Stop" : "🎤 Talk to me"

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
            <button 
                className="bg-white p-2 rounded-3xl text-black"
                onClick={handleClick}
            >
            {label}
            </button>
        </div>
    )
    
}