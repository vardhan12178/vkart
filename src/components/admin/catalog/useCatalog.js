import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";
import { showToast } from "../../../utils/toast";
import useDebounced from "../../../utils/useDebounced";
import { API, TABS, errorText } from "./catalogConfig";

export default function useCatalog() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null); // product id with variants expanded
  const [selected, setSelected] = useState(new Set());
  const q = useDebounced(search.trim(), 300);

  const t = TABS.find((x) => x.key === tab);
  const params = useMemo(
    () => ({
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
      ...(t.status ? { status: t.status } : {}),
      ...(t.stock ? { stock: t.stock } : {}),
      sort,
      page,
      limit: 20,
    }),
    [q, category, t, sort, page]
  );
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [q, category, tab, sort]);

  const listKey = ["admin", "catalog", params];
  const list = useQuery({
    queryKey: listKey,
    queryFn: () => axiosInstance.get(API, { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const data = list.data;
  const counts = data?.counts || {};

  // Swap an edited row into the current page, then refresh counts in the background
  const replaceRow = (row) => {
    queryClient.setQueryData(
      listKey,
      (old) => old && { ...old, products: old.products.map((p) => (p.id === row.id ? row : p)) }
    );
    queryClient.invalidateQueries({ queryKey: ["admin", "catalog"], refetchType: "inactive" });
  };

  const patchProduct = useMutation({
    mutationFn: ({ id, body }) => axiosInstance.patch(`${API}/${id}`, body).then((r) => r.data),
    onSuccess: (row) => {
      replaceRow(row);
      list.refetch();
    },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const bulk = useMutation({
    mutationFn: (body) => axiosInstance.post(`${API}/bulk-status`, body).then((r) => r.data),
    onSuccess: (res) => {
      showToast(
        `${res.updated} product${res.updated === 1 ? "" : "s"} set to ${res.status}`,
        "success"
      );
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
    onError: (err) => showToast(errorText(err), "error"),
  });

  const rows = data?.products || [];
  const allOnPage = rows.length > 0 && rows.every((p) => selected.has(p.id));
  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(rows.map((p) => p.id)));

  return {
    tab,
    setTab,
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    page,
    setPage,
    open,
    setOpen,
    selected,
    clearSelection: () => setSelected(new Set()),
    list,
    data,
    counts,
    rows,
    allOnPage,
    toggle,
    toggleAll,
    replaceRow,
    patchProduct,
    bulk,
  };
}
