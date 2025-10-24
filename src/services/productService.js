const Product = require('../models/Product');
const  logger  = require('../utils/logger');

class ProductService {
  async createProduct(productData) {
    try {
      const product = await Product.create(productData);
      logger.info('Product created', { productId: product._id });
      return product;
    } catch (error) {
      logger.error('Product creation failed', { error: error.message });
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      logger.error('Error fetching product', { productId: id, error: error.message });
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
      logger.info('Product updated', { productId: id });
      return product;
    } catch (error) {
      logger.error('Product update failed', { productId: id, error: error.message });
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      logger.info('Product deleted', { productId: id });
      return product;
    } catch (error) {
      logger.error('Product deletion failed', { productId: id, error: error.message });
      throw error;
    }
  }

  async listProducts(filter = {}, options = {}) {
    try {

      const { page = 1, limit = 10, sort = '-createdAt', ...filters } = options;
      console.log('Filter----------:', filter, (page - 1) * limit);

      
      const query = Product.find(filters)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const [products, total] = await Promise.all([
        query.exec(),
        Product.countDocuments(filters)
      ]);

      return {
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing products', { error: error.message });
      throw error;
    }
  }

  async updateStock(productId, quantity) {
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { allocatedCount: quantity } }
    );
  }
}

module.exports = new ProductService();