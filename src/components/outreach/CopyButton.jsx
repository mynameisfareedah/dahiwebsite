function CopyButton({ label, value, copied, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className="rounded-full border border-dahiPrimary px-3 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
    >
      {copied ? 'Copied successfully' : label}
    </button>
  );
}

export default CopyButton;
