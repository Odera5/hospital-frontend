import { useEffect, useState } from "react";
import {
  readStoredJson,
  removeStoredValue,
  writeStoredJson,
} from "../utils/persistence";

export default function usePersistentState(
  key,
  initialValue,
  options = {},
) {
  const { enabled = true, storage = "session" } = options;

  const [state, setState] = useState(() => {
    if (!enabled) {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
    return readStoredJson(
      key,
      typeof initialValue === "function" ? initialValue() : initialValue,
      storage,
    );
  });

  useEffect(() => {
    if (!enabled) return;
    writeStoredJson(key, state, storage);
  }, [enabled, key, state, storage]);

  const clearState = () => {
    removeStoredValue(key, storage);
    setState(typeof initialValue === "function" ? initialValue() : initialValue);
  };

  return [state, setState, clearState];
}
