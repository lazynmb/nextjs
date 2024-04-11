-- CreateTable
CREATE TABLE "Dochod" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Dochod_pkey" PRIMARY KEY ("id")
);
