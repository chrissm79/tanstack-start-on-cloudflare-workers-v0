import { getBindings } from "@/utils/cf-bindings";
import { createServerFn } from "@tanstack/react-start";

const COUNTER_KEY = "global-counter";

export const getCounter = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const bindings = await getBindings();
      const currentValue = await bindings.COUNTER.get(COUNTER_KEY);
      const count = currentValue ? parseInt(currentValue) : 0;

      return {
        success: true,
        count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting counter:", error);
      throw new Error("Failed to get counter value");
    }
  }
);

export const updateCounter = createServerFn({ method: "POST" })
  .validator((data: { action: "increment" | "decrement" | "reset" }) => data)
  .handler(async ({ data }) => {
    try {
      const bindings = await getBindings();
      const { action } = data;

      // Get current value
      const currentValue = await bindings.COUNTER.get(COUNTER_KEY);
      let count = currentValue ? parseInt(currentValue) : 0;

      // Update based on action
      if (action === "increment") {
        count += 1;
      } else if (action === "decrement") {
        count = Math.max(0, count - 1); // Don't go below 0
      } else if (action === "reset") {
        count = 0;
      } else {
        throw new Error(
          'Invalid action. Use "increment", "decrement", or "reset"'
        );
      }

      // Store the new value in KV
      await bindings.COUNTER.put(COUNTER_KEY, count.toString());

      return {
        success: true,
        count,
        action,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error updating counter:", error);
      throw new Error("Failed to update counter value");
    }
  });
