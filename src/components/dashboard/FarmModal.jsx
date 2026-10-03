import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem
} from "@heroui/react";
import { createFarm, updateFarm } from "../../controllers/adminController";
import toast from "react-hot-toast";

export default function FarmModal({ isOpen, onOpenChange, farm, onSuccess }) {
  const [formData, setFormData] = useState({
    farmName: "",
    phoneNumber: "",
    location: "",
    locationDescription: "",
    farmDescription: "",
    website: "",
    socialMediaHandle: "",
    status: "open",
    rating: 5
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (farm) {
      setFormData({
        farmName: farm.farmName || "",
        phoneNumber: farm.phoneNumber || "",
        location: farm.location || "",
        locationDescription: farm.locationDescription || "",
        farmDescription: farm.farmDescription || "",
        website: farm.website || "",
        socialMediaHandle: farm.socialMediaHandle || "",
        status: farm.status || "open",
        rating: farm.rating || 5,
        imageId: farm.imageId
      });
    } else {
      setFormData({
        farmName: "",
        phoneNumber: "",
        location: "",
        locationDescription: "",
        farmDescription: "",
        website: "",
        socialMediaHandle: "",
        status: "open",
        rating: 5
      });
    }
    setFile(null);
  }, [farm, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (onClose) => {
    setIsLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        rating: parseFloat(formData.rating)
      };
      if (farm) {
        const farmId = farm.$id || farm.id;
        if (!farmId) throw new Error("Farm ID is missing; reload the farms list and try again.");
        await updateFarm(farmId, dataToSubmit, file);
        toast.success("Farm updated successfully");
      } else {
        await createFarm(dataToSubmit, file);
        toast.success("Farm created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{farm ? "Edit Farm" : "Create New Farm"}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Farm Name"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  label="Location Description"
                  name="locationDescription"
                  value={formData.locationDescription}
                  onChange={handleChange}
                />
                <Textarea
                  label="Farm Description"
                  name="farmDescription"
                  value={formData.farmDescription}
                  onChange={handleChange}
                />
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
                <Input
                  label="Social Media Handle"
                  name="socialMediaHandle"
                  value={formData.socialMediaHandle}
                  onChange={handleChange}
                  placeholder="@username"
                />
                <Input
                  label="Rating"
                  name="rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.rating}
                  onChange={handleChange}
                />
                <Select
                  label="Status"
                  name="status"
                  selectedKeys={[formData.status]}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                >
                  <SelectItem key="open" value="open">Open</SelectItem>
                  <SelectItem key="closed" value="closed">Closed</SelectItem>
                  <SelectItem key="underConstruction" value="underConstruction">Under Construction</SelectItem>
                  <SelectItem key="comingSoon" value="comingSoon">Coming Soon</SelectItem>
                </Select>
                <Input
                  type="file"
                  label="Farm Image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                {farm ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
