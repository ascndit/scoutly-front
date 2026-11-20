export function VacancyCardSkeleton() {
    return (
        <div className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs animate-pulse">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2.5 w-2/3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-6 bg-gray-200 rounded-md w-28" />
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-full" />
                <div className="h-3.5 bg-gray-100 rounded w-5/6" />
            </div>
            <div className="mt-5 flex gap-2">
                <div className="h-6 bg-gray-100 rounded-md w-16" />
                <div className="h-6 bg-gray-100 rounded-md w-20" />
                <div className="h-6 bg-gray-100 rounded-md w-14" />
            </div>
        </div>
    );
}