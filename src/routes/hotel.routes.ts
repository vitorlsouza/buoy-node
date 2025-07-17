import { FastifyPluginAsync } from 'fastify';
import { Hotel } from '../entities/hotel.entity';
import { HotelSchema, HotelInput, HotelParamsSchema } from '../schemas/hotel.schema';
import fromZodSchema from 'zod-to-json-schema';

const hotelRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    schema: {
      description: 'Get all hotels',
      tags: ['Hotels']
    }
  }, async () => {
    return await fastify.em.find(Hotel, {});
  });

  fastify.get('/:id', {
    schema: {
      description: 'Get hotel by ID',
      tags: ['Hotels'],
      params: fromZodSchema(HotelParamsSchema)
    }
  }, async (request, reply) => {
    const { id } = HotelParamsSchema.parse(request.params);
    const hotel = await fastify.em.findOne(Hotel, { id });
    
    if (!hotel) {
      return reply.status(404).send({ message: 'Hotel not found' });
    }
    
    return hotel;
  });

  fastify.post<{ Body: HotelInput }>('/', {
    schema: {
      description: 'Create a new hotel',
      tags: ['Hotels'],
      body: fromZodSchema(HotelSchema)
    }
  }, async (request, reply) => {
    try {
      const data = HotelSchema.parse(request.body);
      const hotel = fastify.em.create(Hotel, data);
      await fastify.em.persistAndFlush(hotel);
      return reply.status(201).send(hotel);
    } catch (error) {
      return reply.status(400).send(error);
    }
  });

  fastify.put<{ Params: { id: number }; Body: HotelInput }>('/:id', {
    schema: {
      description: 'Update a hotel',
      tags: ['Hotels'],
      params: fromZodSchema(HotelParamsSchema),
      body: fromZodSchema(HotelSchema)
    }
  }, async (request, reply) => {
    try {
      const { id } = HotelParamsSchema.parse(request.params);
      const data = HotelSchema.parse(request.body);
      
      const hotel = await fastify.em.findOne(Hotel, { id });
      if (!hotel) {
        return reply.status(404).send({ message: 'Hotel not found' });
      }
      
      fastify.em.assign(hotel, data);
      await fastify.em.persistAndFlush(hotel);
      return hotel;
    } catch (error) {
      return reply.status(400).send(error);
    }
  });

  fastify.delete<{ Params: { id: number } }>('/:id', {
    schema: {
      description: 'Delete a hotel',
      tags: ['Hotels'],
      params: fromZodSchema(HotelParamsSchema)
    }
  }, async (request, reply) => {
    try {
      const { id } = HotelParamsSchema.parse(request.params);
      const hotel = await fastify.em.findOne(Hotel, { id });
      
      if (!hotel) {
        return reply.status(404).send({ message: 'Hotel not found' });
      }
      
      await fastify.em.removeAndFlush(hotel);
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send(error);
    }
  });
};

export default hotelRoutes;