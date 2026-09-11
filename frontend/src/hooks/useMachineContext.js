import { useEffect, useState } from 'react';
import { fetchContext } from '../lib/api';

// Loads the real machine context once at boot — replaces react-export's
// hardcoded src/data/tags.js dictionary. Tag ids, names, units, and
// thresholds all come from the live backend, whatever it currently returns.
export function useMachineContext() {
  const [tags, setTags] = useState([]);
  const [tagsById, setTagsById] = useState({});
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchContext()
      .then(({ tags: fetchedTags, hierarchy: fetchedHierarchy }) => {
        if (cancelled) return;
        const byId = {};
        fetchedTags.forEach((tag) => {
          byId[tag.id] = tag;
        });
        setTags(fetchedTags);
        setTagsById(byId);
        setHierarchy(fetchedHierarchy);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tags, tagsById, hierarchy, loading, error };
}
