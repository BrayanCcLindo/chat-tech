"use client";

import { useState } from "react";
import {
  useUsers,
  useCreateConversation,
  useCreateUser,
  useConversations
} from "@/hooks/use-messaging";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, PlusCircle } from "lucide-react";
import { userId1 as currentUserId } from "@/lib/msw/mock-data";

interface NewConversationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function NewConversationDialog({
  isOpen,
  onOpenChange,
  onConversationCreated
}: NewConversationDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users = [] } = useUsers();
  const { data: conversations = [] } = useConversations(currentUserId);

  const createConversation = useCreateConversation();
  const createUser = useCreateUser();
  const [errorMsg, setErrorMsg] = useState("");
  const [tabValue, setTabValue] = useState("contacts");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      contactName: "",
      contactPhone: ""
    }
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUser(prev => (prev === userId ? null : userId));
  };

  const handleCreateDirect = async () => {
    if (!selectedUser) return;

    const alreadyExists = conversations.some(conv => conv.id === selectedUser);

    if (alreadyExists) {
      const userName =
        users.find(u => u.id === selectedUser)?.name || "este usuario";
      setErrorMsg(`Ya existe una conversación con ${userName}.`);
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        name: users.find(u => u.id === selectedUser)?.name ?? "",
        type: "direct",
        id: selectedUser
      });
      onConversationCreated?.(conversation.id);
      handleClose();
      setErrorMsg("");
    } catch (error) {
      console.error("Failed to create direct conversation:", error);
    }
  };
  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleCreateContact = async (data: {
    contactName: string;
    contactPhone: string;
  }) => {
    if (!data.contactName.trim() || !data.contactPhone.trim()) return;

    try {
      await createUser.mutateAsync({
        name: data.contactName.trim(),
        phone: data.contactPhone.trim()
      });
      setTabValue("contacts");
    } catch (error) {
      console.error("Failed to create contact:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
        </DialogHeader>

        <Tabs
          value={tabValue}
          onValueChange={value => {
            setTabValue(value);
            setErrorMsg("");
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Contactos
            </TabsTrigger>
            <TabsTrigger value="newContact" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nuevo contacto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="mt-4">
              <Label htmlFor="search">Buscar contacto</Label>
              <Input
                id="search"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUser === user.id}
                      onChange={() => handleUserToggle(user.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.isOnline && (
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateDirect}
                disabled={!selectedUser || createConversation.isPending}
              >
                {createConversation.isPending
                  ? "Creando..."
                  : "Crear conversación"}
              </Button>
            </div>
            {errorMsg && (
              <div className="p-2 bg-red-100 text-red-700 rounded mb-2 text-sm">
                {errorMsg}
              </div>
            )}
          </TabsContent>
          <TabsContent value="newContact" className="space-y-4">
            <div className="space-y-4 mt-4">
              <form
                onSubmit={handleSubmit(handleCreateContact)}
                className="space-y-4 "
              >
                <div>
                  <Label htmlFor="contactName">Nombre del contacto</Label>
                  <Input
                    id="contactName"
                    placeholder="Ingresa el nombre completo..."
                    {...register("contactName", {
                      required: "El nombre es obligatorio"
                    })}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.contactName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Número de teléfono</Label>
                  <Input
                    id="contactPhone"
                    placeholder="Ingresa el número de teléfono..."
                    maxLength={9}
                    {...register("contactPhone", {
                      required: "El número es obligatorio",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Solo se permiten números"
                      },
                      minLength: {
                        value: 9,
                        message: "Debe tener exactamente 9 dígitos"
                      },
                      maxLength: {
                        value: 9,
                        message: "Debe tener exactamente 9 dígitos"
                      }
                    })}
                  />
                  {errors.contactPhone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.contactPhone.message}
                    </p>
                  )}
                </div>

                {createUser.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ¡Contacto creado exitosamente!
                    </p>
                  </div>
                )}

                {createUser.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      Error al crear el contacto. Inténtalo de nuevo.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending ? "Creando..." : "Crear contacto"}
                  </Button>
                </div>
              </form>
            </div>

            {/* <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                
                disabled={
                  !newContactName.trim() ||
                  !newContactPhone.trim() ||
                  createUser.isPending
                }
              >
                {createUser.isPending ? "Creando..." : "Crear contacto"}
              </Button>
            </div> */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
