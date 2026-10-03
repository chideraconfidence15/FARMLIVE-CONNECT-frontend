import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Image,
  Tooltip,
  Input,
  Chip
} from "@heroui/react";
import { fetchAllFarms } from "../../controllers/productController";
import { deleteFarm } from "../../controllers/adminController";
import FarmModal from "./FarmModal";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Pencil, Trash2, Plus, Star } from "lucide-react";

export default function FarmsTab({ isCreateOpen, onOpenChangeCreate, onOpenNewFarm }) {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedFarm, setSelectedFarm] = useState(null);

  const loadFarms = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllFarms();
      setFarms(data);
    } catch (error) {
      toast.error("Failed to load farms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleEdit = (farm) => {
    setSelectedFarm(farm);
    onOpen();
  };

  const handleDelete = async (farm) => {
    const id = farm.$id || farm.id;
    if (window.confirm(`Are you sure you want to delete ${farm.farmName}?`)) {
      try {
        await deleteFarm(id, farm.imageId);
        toast.success("Farm deleted successfully");
        loadFarms();
      } catch (error) {
        toast.error("Failed to delete farm");
      }
    }
  };

  const handleCreate = () => {
    setSelectedFarm(null);
    if (onOpenNewFarm) {
      onOpenNewFarm();
    } else {
      onOpen();
    }
  };

  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (f.farmName && f.farmName.toLowerCase().includes(q)) ||
        (f.location && f.location.toLowerCase().includes(q)) ||
        (f.phoneNumber && f.phoneNumber.includes(q)) ||
        (f.farmDescription && f.farmDescription.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (f.status && f.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [farms, searchQuery, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "success";
      case "closed":
        return "danger";
      case "underconstruction":
      case "comingsoon":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Farms & Breeders</h2>
          <p className="text-xs text-gray-500">Register pastoral ranches, verify breeders, and manage contact locations.</p>
        </div>
        <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" startContent={<Plus size={16} aria-hidden="true" />} onPress={handleCreate}>
          Register New Farm
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="w-full sm:w-72">
          <Input
            size="sm"
            placeholder="Search farm name, state, phone..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            isClearable
            startContent={<Search size={16} className="text-gray-400" aria-hidden="true" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Status:</span>
          {["all", "open", "closed", "comingSoon"].map((st) => (
            <Button
              key={st}
              size="sm"
              className={`bg-[#14532D] text-xs capitalize text-yellow-300 hover:bg-[#166534] ${statusFilter === st ? "font-bold ring-2 ring-yellow-300" : ""}`}
              onPress={() => setStatusFilter(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table aria-label="Farms management table" className="min-w-full">
        <TableHeader>
          <TableColumn>FARM & RANCH</TableColumn>
          <TableColumn>LOCATION</TableColumn>
          <TableColumn>PHONE</TableColumn>
          <TableColumn>RATING</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={"No farms found matching your search."}>
          {filteredFarms.map((farm) => {
            const id = farm.$id || farm.id;

            return (
              <TableRow key={id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={farm.img}
                      alt={farm.farmName}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                      fallbackSrc="https://via.placeholder.com/150"
                    />
                    <div>
                      <p className="font-semibold text-xs text-gray-900">{farm.farmName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">ID: {id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-700">{farm.location || "Nigeria"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600 font-mono">{farm.phoneNumber || "N/A"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star size={14} fill="currentColor" aria-hidden="true" />
                    <span>{Number(farm.rating || 4.8).toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={getStatusColor(farm.status)} variant="flat" className="capitalize text-xs font-semibold">
                    {farm.status || "open"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 items-center">
                    <Tooltip content="View Farm Page">
                      <Link
                        to={`/farms/${id}`}
                        className="p-1.5 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="View Public Farm Page"
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                      </Link>
                    </Tooltip>
                    <Tooltip content="Edit Farm">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(farm)}>
                        <Pencil size={16} className="text-blue-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete Farm">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(farm)}>
                        <Trash2 size={16} className="text-red-500" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <FarmModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        farm={selectedFarm}
        onSuccess={loadFarms}
      />
    </div>
  );
}
