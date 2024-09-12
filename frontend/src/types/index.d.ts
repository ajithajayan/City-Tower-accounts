    // Basic entity types
    export interface Category {
      id: number;
      name: string;
    }

    export interface Dish {
      id: number;
      name: string;
      description: string;
      price: number;
      image: string;
      category: number | Category;
    }

export interface OrderItem {
  is_newly_added: boolean | undefined;
  dish: number;
  quantity: number;
  variants?: { variantId: number; name: string; quantity: number }[];
}


    export interface Order {
      kitchen_note: ReactNode;
      kitchen_note: any;
      detail: Order;
      id: number;
      created_at: string;
      total_amount: number;
      status: "pending" | "approved" | "cancelled" | "delivered";
      bill_generated: boolean;
      items: OrderItem[];
      order_type: "dining" | "takeaway" | "delivery";
      delivery_order_status: "pending" | "accepted" | "in_progress" | "delivered" | "cancelled",
      delivery_driver: {
        username: string;
        mobile_number: number;
        email: string;
      };
      payment_method: "cash" | "bank" | "cash-bank" | "credit" | string;
      cash_amount: number;
      bank_amount: number;
      credit_user_id: number;
      customer_phone_number: number;
      customer_name: number;
      address: string;
      detail:string;
    }

    export interface Bill {
      id: number;
      order: Order;
      total_amount: number;
      paid: boolean;
      billed_at: string;
    }

    export interface Notification {
      id: number;
      message: string;
      created_at: string;
      is_read: boolean;
    }

    // API response types
    export interface ApiResponse<T> {
      count: number;
      next: string | null;
      previous: string | null;
      results: T[];
    }

    // Form types
    export interface DishFormData {
      name: string;
      description: string;
      price: number;
      category: number;
      image?: File;
    }

    export interface OrderFormData {
      items: OrderItem[];
      total_amount: number;
      status: "pending" | "approved" | "cancelled" | "delivered";
      order_type: "dining" | "takeaway" | "delivery";
      payment_method?: "cash" | "bank" | "cash-bank" | "credit";
      bank_amount?: number;
      cash_amount?: number | string;
      customer_name: string;
      address: string;
      customer_phone_number: string;
      delivery_charge: number;
      delivery_driver_id: number | null;
      credit_user_id?: number | null;
      kitchen_note?: string;
    }

    // Analytics types
    export interface AnalyticsData {
      daily_sales: DailySales[];
      total_income: number;
      new_customers: number;
    }

    export interface DailySales {
      date: string;
      total_sales: number;
      order_count: number;
    }

    export interface TopDish {
      dish__name: string;
      dish__image: string;
      orders: number;
    }

    export interface CategorySales {
      dish__category__name: string;
      value: number;
    }

    export interface TimeSlot {
      hour: string;
      order_count: number;
      formattedHour: string;
    }

    export interface DashboardData {
      daily_sales: DailySales[];
      total_income: number;
      popular_time_slots: TimeSlot[];
      top_dishes: TopDish[];
      category_sales: CategorySales[];
      total_orders: number;
      avg_order_value: number;
      total_income_trend: number;
      total_orders_trend: number;
      avg_order_value_trend: number;
    }

    // Component prop types
    export interface CategoryItemProps {
      category: Category;
    }

    export interface CategoryListProps {
      category: Category[];
    }

    export interface DishItemProps {
      dish: Dish;
      onAddDish: (dish: Dish) => void;
    }

    export interface DishListProps {
      dishes: Dish[];
      onAddDish: (dish: Dish) => void;
    }

    export interface OrderItemProps {
      orderItem: OrderItem;
      incrementQuantity: (id: number) => void;
      decrementQuantity: (id: number) => void;
      removeItem: (id: number) => void;
    }

    export interface OrderListProps {
      orders: Order[];
    }

    // Hook return types
    export interface UseCategoriesReturn {
      categories: ApiResponse<Category> | undefined;
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    }

    export interface UseDishesReturn {
      dishes: ApiResponse<Dish> | undefined;
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
      addDishToOrder: (id: number, quantity: number) => void;
      page: number;
      setPage: (page: number) => void;
    }

    export interface UseOrdersReturn {
      orders: ApiResponse<Order> | undefined;
      isLoading: boolean;
      isError: boolean;
      createOrder: (data: OrderFormData) => void;
      refetch: () => void;
    }

    // Error types
    export interface ApiError {
      message: string;
      status: number;
    }

    // State types (if using Redux)
    export interface RootState {
      dishes: {
        items: Dish[];
        loading: boolean;
        error: string | null;
      };
      orders: {
        items: Order[];
        loading: boolean;
        error: string | null;
      };
      notifications: {
        items: Notification[];
        unreadCount: number;
      };
    }

    // Action types (if using Redux)
    export type ActionType =
      | { type: "FETCH_DISHES_REQUEST" }
      | { type: "FETCH_DISHES_SUCCESS"; payload: Dish[] }
      | { type: "FETCH_DISHES_FAILURE"; payload: string }
      | { type: "CREATE_ORDER_REQUEST" }
      | { type: "CREATE_ORDER_SUCCESS"; payload: Order }
      | { type: "CREATE_ORDER_FAILURE"; payload: string }
      | { type: "ADD_NOTIFICATION"; payload: Notification }
      | { type: "MARK_NOTIFICATION_READ"; payload: number };

    // Utility types
    export type STATUS_TYPE = "pending" | "approved" | "cancelled" | "delivered";

    export interface PaginationProps {
      currentPage: number;
      totalPages: number;
      onPageChange: (page: number) => void;
    }

    export interface SortOption {
      value: string;
      label: string;
    }

    export interface FilterOption {
      value: string | number;
      label: string;
    }

    export interface TableColumn<T> {
      key: keyof T;
      header: string;
      render?: (value: T[keyof T], item: T) => React.ReactNode;
    }
    export interface MenuItem {
      id: number;
      dish: Dish;
      meal_type: string;
    }

    export interface Menu {
      id: number;
      name: string;
      sub_total: number;
      menu_items: MenuItem[];
    }

    export interface MessType {
      id: number;
      name: string;
    }

    // Add FloorName type and initialFloors array
    export type FloorName =
      | "Ground floor"
      | "1st Floor"
      | "2nd floor"
      | "3rd floor";

    export const initialFloors: FloorName[] = [
      "Ground floor",
      "1st Floor",
      "2nd floor",
      "3rd floor",
    ];

    // Delivery Driver
    export type DeliveryDriver = {
      id: number;
      username: string;
      email: string;
      mobile_number: string;
      is_active: boolean;
      is_available: boolean;
    };

    export type DeliveryOrderStatus =
      | "pending"
      | "accepted"
      | "in_progress"
      | "delivered"
      | "cancelled";

    export type DeliveryOrder = {
      id: number;
      driver: number;
      driver_name: string;
      status: string;
      order: Order;
      created_at: Date;
      updated_at: Date;
    };

    export type PaginatedResponse<T> = {
      count: number;
      next: string | null;
      previous: string | null;
      results: T[];
    };

    // Credit User
    export type CreditUser = {
      id: number;
      username: string;
    }

    export type CreditUserForm = {
      username: string;
      mobile_number:string;
      limit_amount:string;
      time_period: Date | null,
      is_active: boolean,
    }
