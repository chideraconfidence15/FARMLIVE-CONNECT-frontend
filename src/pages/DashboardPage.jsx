import React, { useState } from "react";
import { Tabs, Tab, Card, CardBody, Button, useDisclosure } from "@heroui/react";
import { BarChart3, Beef, House, Tags, ClipboardList, UsersRound, ArrowLeft, ArrowRight } from "lucide-react";
import OverviewTab from "../components/dashboard/OverviewTab";
import FarmsTab from "../components/dashboard/FarmsTab";
import ProductsTab from "../components/dashboard/ProductsTab";
import CategoriesTab from "../components/dashboard/CategoriesTab";
import OrdersTab from "../components/dashboard/OrdersTab";
import UsersTab from "../components/dashboard/UsersTab";

import ProductModal from "../components/dashboard/ProductModal";
import FarmModal from "../components/dashboard/FarmModal";
import CategoryModal from "../components/dashboard/CategoryModal";
import OrderModal from "../components/dashboard/OrderModal";
import UserModal from "../components/dashboard/UserModal";

const dashboardTabOrder = ["overview", "products", "farms", "categories", "orders", "users"];

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const selectedTabIndex = dashboardTabOrder.indexOf(selectedTab);
  const previousTab = dashboardTabOrder[selectedTabIndex - 1];
  const nextTab = dashboardTabOrder[selectedTabIndex + 1];

  // Global Creation Modals accessible across tabs
  const productModal = useDisclosure();
  const farmModal = useDisclosure();
  const categoryModal = useDisclosure();
  const orderModal = useDisclosure();
  const userModal = useDisclosure();

  // Refresh key to trigger re-renders on child tabs when new data is created
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
              Admin Operations Dashboard
            </h1>
            <span className="text-xs bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full border border-green-200">
              CRUD Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Perform Create, Read, Update, and Delete operations across all livestock listings, partner farms, customer orders, categories, and user permissions.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]"
            isDisabled={!previousTab}
            aria-label={previousTab ? `Go to previous dashboard section: ${previousTab}` : "First dashboard section"}
            startContent={<ArrowLeft size={16} aria-hidden="true" />}
            onPress={() => previousTab && setSelectedTab(previousTab)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            className="bg-[#14532D] text-yellow-300 hover:bg-[#166534]"
            isDisabled={!nextTab}
            aria-label={nextTab ? `Go to next dashboard section: ${nextTab}` : "Last dashboard section"}
            endContent={<ArrowRight size={16} aria-hidden="true" />}
            onPress={() => nextTab && setSelectedTab(nextTab)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Dashboard Management Modules"
        variant="solid"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        classNames={{
          tabList: "flex w-full flex-row flex-nowrap gap-2 overflow-x-auto rounded-xl bg-[#14532D] p-1.5",
          cursor: "bg-[#166534] shadow-md",
          tab: "h-10 shrink-0 whitespace-nowrap text-xs md:text-sm font-semibold rounded-lg px-4 text-yellow-300 transition-all",
        }}
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 size={16} aria-hidden="true" />
              <span>Overview & Analytics</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4 bg-transparent">
            <CardBody className="p-0">
              <OverviewTab
                key={`overview-${refreshKey}`}
                setActiveTab={setSelectedTab}
                onOpenProductModal={productModal.onOpen}
                onOpenFarmModal={farmModal.onOpen}
                onOpenCategoryModal={categoryModal.onOpen}
                onOpenOrderModal={orderModal.onOpen}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="products"
          title={
            <div className="flex items-center gap-2">
              <Beef size={16} aria-hidden="true" />
              <span>Livestock & Produce</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4">
            <CardBody className="p-5">
              <ProductsTab
                key={`products-${refreshKey}`}
                onOpenNewProduct={productModal.onOpen}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="farms"
          title={
            <div className="flex items-center gap-2">
              <House size={16} aria-hidden="true" />
              <span>Farms & Breeders</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4">
            <CardBody className="p-5">
              <FarmsTab
                key={`farms-${refreshKey}`}
                onOpenNewFarm={farmModal.onOpen}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="categories"
          title={
            <div className="flex items-center gap-2">
              <Tags size={16} aria-hidden="true" />
              <span>Categories</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4">
            <CardBody className="p-5">
              <CategoriesTab
                key={`categories-${refreshKey}`}
                onOpenNewCategory={categoryModal.onOpen}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="orders"
          title={
            <div className="flex items-center gap-2">
              <ClipboardList size={16} aria-hidden="true" />
              <span>Orders Management</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4">
            <CardBody className="p-5">
              <OrdersTab
                key={`orders-${refreshKey}`}
                onOpenNewOrder={orderModal.onOpen}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="users"
          title={
            <div className="flex items-center gap-2">
              <UsersRound size={16} aria-hidden="true" />
              <span>Users & Roles</span>
            </div>
          }
        >
          <Card className="border border-gray-200 shadow-sm mt-4">
            <CardBody className="p-5">
              <UsersTab
                key={`users-${refreshKey}`}
              />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Global Quick Creation Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onOpenChange={productModal.onOpenChange}
        product={null}
        onSuccess={handleSuccess}
      />

      <FarmModal
        isOpen={farmModal.isOpen}
        onOpenChange={farmModal.onOpenChange}
        farm={null}
        onSuccess={handleSuccess}
      />

      <CategoryModal
        isOpen={categoryModal.isOpen}
        onOpenChange={categoryModal.onOpenChange}
        category={null}
        onSuccess={handleSuccess}
      />

      <OrderModal
        isOpen={orderModal.isOpen}
        onOpenChange={orderModal.onOpenChange}
        order={null}
        onSuccess={handleSuccess}
      />

      <UserModal
        isOpen={userModal.isOpen}
        onOpenChange={userModal.onOpenChange}
        user={null}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
