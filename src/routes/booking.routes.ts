import { FastifyPluginAsync } from "fastify";
import { Booking } from "../entities/booking.entity";
import { Accommodation } from "../entities/accommodation.entity";
import { Apartment } from "../entities/apartment.entity";
import {
  BookingInput,
  BookingSchema,
  BookingJsonSchema,
  BookingParamsSchema,
} from "../schemas/booking.schema";
import fromZodSchema from "zod-to-json-schema";

const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        description: "Get all bookings",
        tags: ["Bookings"],
      },
    },
    async () => {
      return await fastify.em.find(
        Booking,
        {},
        { populate: ["accommodation"] }
      );
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get booking by ID",
        tags: ["Bookings"],
        params: fromZodSchema(BookingParamsSchema),
      },
    },
    async (request, reply) => {
      const { id } = BookingParamsSchema.parse(request.params);
      const booking = await fastify.em.findOne(
        Booking,
        { id },
        { populate: ["accommodation"] }
      );

      if (!booking) {
        return reply.status(404).send({ message: "Booking not found" });
      }

      return booking;
    }
  );

  fastify.post<{ Body: BookingInput }>(
    "/",
    {
      schema: {
        description: "Create a new booking",
        tags: ["Bookings"],
        body: BookingJsonSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = BookingSchema.parse(request.body);
        const accommodation = await fastify.em.findOne(Accommodation, {
          id: data.accommodationId,
        });

        if (!accommodation) {
          return reply
            .status(400)
            .send({ message: "Invalid accommodation ID" });
        }

        if (accommodation instanceof Apartment) {
          const overlappingBookings = await fastify.em.find(Booking, {
            accommodation: accommodation.id,
            $or: [
              {
                startDate: { $lte: new Date(data.endDate) },
                endDate: { $gte: new Date(data.startDate) },
              },
            ],
          });

          if (overlappingBookings.length > 0) {
            return reply.status(400).send({
              message: "Apartment is not available for the selected dates.",
            });
          }
        }

        const booking = fastify.em.create(Booking, {
          ...data,
          accommodation,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        });

        await fastify.em.persistAndFlush(booking);
        return reply.status(201).send(booking);
      } catch (error) {
        return reply.status(400).send(error);
      }
    }
  );
};

export default bookingRoutes;
