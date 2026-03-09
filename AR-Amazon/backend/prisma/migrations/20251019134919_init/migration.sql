-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model3D" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productName" TEXT,
    "originalImageUrl" TEXT NOT NULL,
    "meshyTaskId" TEXT NOT NULL,
    "meshyStatus" TEXT NOT NULL DEFAULT 'pending',
    "modelUrl" TEXT,
    "thumbnailUrl" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 5,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model3D_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Model3D_meshyTaskId_key" ON "Model3D"("meshyTaskId");

-- CreateIndex
CREATE INDEX "Model3D_userId_idx" ON "Model3D"("userId");

-- CreateIndex
CREATE INDEX "Model3D_meshyStatus_idx" ON "Model3D"("meshyStatus");

-- AddForeignKey
ALTER TABLE "Model3D" ADD CONSTRAINT "Model3D_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
