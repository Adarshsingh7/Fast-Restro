import axios, { AxiosInstance, AxiosResponse } from "axios";
import { MenuItem } from "../../types/menuType";

export const fetchMenuItems = async () => {
  const data = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/menus`,
  );

  return data?.data?.data?.data;
};

class MenuService {
  private api: AxiosInstance;

  constructor() {
    // Initialize Axios instance with base URL.
    this.api = axios.create({
      // baseURL: "https://oyster-app-s59tr.ondigitalocean.app/api/v1/menus",
      baseURL: `${import.meta.env.VITE_API_URL}/api/v1/menus`,
    });
    this.updateMenu = this.updateMenu.bind(this);
    this.getMenu = this.getMenu.bind(this);
    this.getAllMenu = this.getAllMenu.bind(this);
    this.createMenu = this.createMenu.bind(this);
    this.deleteMenu = this.deleteMenu.bind(this);
  }

  // Get all orders
  public async getAllMenu(restroId: string | undefined): Promise<MenuItem[]> {
    try {
      const response: AxiosResponse<{ data: { data: MenuItem[] } }> = restroId
        ? await this.api.get(`/?owner=${restroId}`)
        : await this.api.get(`/`);
      return response.data.data.data;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  }

  // Get a single order by ID
  public async getMenu(id: string): Promise<MenuItem> {
    try {
      const response: AxiosResponse<{ data: { data: MenuItem } }> =
        await this.api.get(`/${id}`);
      return response.data.data.data;
    } catch (error) {
      console.error(`Error fetching order with id ${id}:`, error);
      throw error;
    }
  }

  // Create a new order
  public async createMenu(
    menuData: Partial<MenuItem> | FormData,
  ): Promise<MenuItem> {
    try {
      const response: AxiosResponse<{ data: { data: MenuItem } }> =
        await this.api.post("/", menuData);
      return response.data.data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  // Update an existing order by ID
  public async updateMenu(
    id: string,
    updatedData: Partial<MenuItem> | FormData,
  ): Promise<MenuItem> {
    try {
      if (updatedData instanceof FormData) {
        const response: AxiosResponse<MenuItem> = await this.api.patch(
          `/${id}`,
          updatedData,
        ); // Axios sets correct headers
        return response.data;
      } else {
        const response: AxiosResponse<MenuItem> = await this.api.patch(
          `/${id}`,
          updatedData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating order with id ${id}:`, error);
      throw error;
    }
  }

  // Delete an order by ID
  public async deleteMenu(id: string): Promise<void> {
    try {
      await this.api.delete(`/${id}`);
    } catch (error) {
      console.error(`Error deleting order with id ${id}:`, error);
      throw error;
    }
  }
}

const menu = new MenuService();

export { menu };
