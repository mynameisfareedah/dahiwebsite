import CopyButton from './CopyButton';

function DonationCard({ account, copiedValue, onCopy }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">{account.title}</p>
        <h4 className="mt-1 text-lg font-bold text-slate-900">{account.bankName}</h4>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account Name</p>
          <p className="mt-1 font-semibold text-slate-900">{account.accountName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account Number</p>
          <p className="mt-1 font-semibold text-slate-900">{account.accountNumber}</p>
        </div>
        {account.sortCode ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sort Code</p>
            <p className="mt-1 font-semibold text-slate-900">{account.sortCode}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          label="Copy Account Name"
          value={account.accountName}
          copied={copiedValue === `account-name:${account.id}`}
          onCopy={() => onCopy(`account-name:${account.id}`, account.accountName)}
        />
        <CopyButton
          label="Copy Account Number"
          value={account.accountNumber}
          copied={copiedValue === `account-number:${account.id}`}
          onCopy={() => onCopy(`account-number:${account.id}`, account.accountNumber)}
        />
        {account.sortCode ? (
          <CopyButton
            label="Copy Sort Code"
            value={account.sortCode}
            copied={copiedValue === `sort-code:${account.id}`}
            onCopy={() => onCopy(`sort-code:${account.id}`, account.sortCode)}
          />
        ) : null}
      </div>
    </div>
  );
}

export default DonationCard;
