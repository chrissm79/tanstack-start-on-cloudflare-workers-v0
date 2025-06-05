import { getCounter, updateCounter } from "@/routes/api/counter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function Counter() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query to get the current counter value
  const {
    data,
    error,
    isLoading: queryLoading,
  } = useQuery({
    queryKey: ["counter"],
    queryFn: () => getCounter(),
    refetchInterval: 30000, // Refetch every 30 seconds to stay in sync
  });

  // Mutation to update the counter
  const mutation = useMutation({
    mutationFn: updateCounter,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      // Invalidate and refetch the counter query
      queryClient.invalidateQueries({ queryKey: ["counter"] });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleAction = async (action: "increment" | "decrement" | "reset") => {
    try {
      await mutation.mutateAsync({ data: { action } });
    } catch (error) {
      console.error("Failed to update counter:", error);
    }
  };

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-medium">Failed to load counter</p>
        <p className="text-red-600 text-sm mt-1">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">KV Counter</h2>

        <div className="mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {data?.count ?? 0}
          </div>
          <p className="text-sm text-gray-500">Stored in Cloudflare KV</p>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={() => handleAction("increment")}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "+1"
              )}
            </button>
            <button
              onClick={() => handleAction("decrement")}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "-1"
              )}
            </button>
          </div>

          <button
            onClick={() => handleAction("reset")}
            disabled={isLoading}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Reset"
            )}
          </button>
        </div>

        {data?.timestamp && (
          <p className="text-xs text-gray-400 mt-4">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live KV Storage</span>
        </div>
      </div>
    </div>
  );
}
